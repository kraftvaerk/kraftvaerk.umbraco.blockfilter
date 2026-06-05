#if NET10_0_OR_GREATER

using System.Linq.Expressions;
using System.Reflection;
using System.Reflection.Emit;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;

namespace kraftvaerk.umbraco.blockfilter.Backend.OpenApi;

public static partial class UmbracoBackOfficeOpenApi
{
    internal static bool IsSwashbucklePresent() =>
        Type.GetType("Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions, Swashbuckle.AspNetCore.SwaggerGen") is not null;

    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void RegisterSwashbuckle(IUmbracoBuilder builder, BackOfficeApiDocumentOptions document)
    {
        var swaggerGenOptionsType = Type.GetType(
            "Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions, Swashbuckle.AspNetCore.SwaggerGen");
        if (swaggerGenOptionsType is null) return;

        var configureMethod = typeof(OptionsServiceCollectionExtensions)
            .GetMethods(BindingFlags.Static | BindingFlags.Public)
            .FirstOrDefault(m => m.Name == "Configure"
                && m.IsGenericMethod
                && m.GetParameters().Length == 2
                && m.GetParameters()[0].ParameterType == typeof(IServiceCollection));
        if (configureMethod is null) return;

        // Build Action<SwaggerGenOptions> via expression so no Swashbuckle token
        // appears in any IL method signature that the type-scanner would inspect.
        var param = Expression.Parameter(swaggerGenOptionsType, "opts");
        var applyMethod = typeof(UmbracoBackOfficeOpenApi)
            .GetMethod(nameof(ApplySwaggerGenOptions), BindingFlags.Static | BindingFlags.NonPublic)!;

        var action = Expression.Lambda(
            Expression.GetActionType(swaggerGenOptionsType),
            Expression.Call(applyMethod,
                Expression.Convert(param, typeof(object)),
                Expression.Constant(document)),
            param).Compile();

        configureMethod.MakeGenericMethod(swaggerGenOptionsType)
            .Invoke(null, [builder.Services, action]);
    }

    private static void ApplySwaggerGenOptions(object opts, BackOfficeApiDocumentOptions doc)
    {
        // In newer Swashbuckle, SwaggerDoc is an extension method — not visible via GetMethods()
        // on the instance. The actual store is SwaggerGeneratorOptions.SwaggerDocs, an
        // IDictionary<string, OpenApiInfo> we can write to directly.
        var generatorOpts = opts.GetType().GetProperty("SwaggerGeneratorOptions")?.GetValue(opts);
        if (generatorOpts is null) return;

        var swaggerDocsProp = generatorOpts.GetType().GetProperty("SwaggerDocs");
        if (swaggerDocsProp is null) return;

        // Derive OpenApiInfo type from the dictionary's second type argument — immune to
        // Microsoft.OpenApi assembly name/version changes across Swashbuckle releases.
        var openApiInfoType = swaggerDocsProp.PropertyType.GetGenericArguments().ElementAtOrDefault(1);
        if (openApiInfoType is null) return;

        var info = Activator.CreateInstance(openApiInfoType)!;
        openApiInfoType.GetProperty("Title")?.SetValue(info, doc.Title);
        openApiInfoType.GetProperty("Version")?.SetValue(info, doc.Version);

        if (doc.Description is not null)
            openApiInfoType.GetProperty("Description")?.SetValue(info, doc.Description);

        SetContact(openApiInfoType, info, doc);
        SetLicense(openApiInfoType, info, doc);

        // IDictionary<string, OpenApiInfo> implements the non-generic IDictionary
        var swaggerDocs = swaggerDocsProp.GetValue(generatorOpts) as System.Collections.IDictionary;
        swaggerDocs?[doc.DocumentName] = info;

        AddSecurityOperationFilter(opts, doc.DocumentName);
    }

    private static void SetContact(Type openApiInfoType, object info, BackOfficeApiDocumentOptions doc)
    {
        if (doc.ContactName is null && doc.ContactEmail is null && doc.ContactUrl is null) return;

        var contactType = openApiInfoType.GetProperty("Contact")?.PropertyType;
        if (contactType is null) return;

        var contact = Activator.CreateInstance(contactType)!;
        if (doc.ContactName is not null) contactType.GetProperty("Name")?.SetValue(contact, doc.ContactName);
        if (doc.ContactEmail is not null) contactType.GetProperty("Email")?.SetValue(contact, doc.ContactEmail);
        if (doc.ContactUrl is not null) contactType.GetProperty("Url")?.SetValue(contact, doc.ContactUrl);
        openApiInfoType.GetProperty("Contact")?.SetValue(info, contact);
    }

    private static void SetLicense(Type openApiInfoType, object info, BackOfficeApiDocumentOptions doc)
    {
        if (doc.LicenseName is null) return;

        var licenseType = openApiInfoType.GetProperty("License")?.PropertyType;
        if (licenseType is null) return;

        var license = Activator.CreateInstance(licenseType)!;
        licenseType.GetProperty("Name")?.SetValue(license, doc.LicenseName);
        if (doc.LicenseUrl is not null) licenseType.GetProperty("Url")?.SetValue(license, doc.LicenseUrl);
        openApiInfoType.GetProperty("License")?.SetValue(info, license);
    }

    private static void AddSecurityOperationFilter(object opts, string documentName)
    {
        // Find Umbraco's abstract base for back-office security operation filters
        Type? baseFilterType = null;
        foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
        {
            try { baseFilterType = asm.GetType("Umbraco.Cms.Api.Management.OpenApi.BackOfficeSecurityRequirementsOperationFilterBase"); }
            catch { }
            if (baseFilterType is not null) break;
        }
        if (baseFilterType is null) return;

        // ApiName is 'protected abstract string ApiName' — get the getter to override
        var apiNameGetter = baseFilterType
            .GetProperty("ApiName", BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Instance)
            ?.GetGetMethod(nonPublic: true);
        if (apiNameGetter is null) return;

        // Emit a dynamic sealed subclass: protected override string ApiName => documentName
        var asmBuilder = AssemblyBuilder.DefineDynamicAssembly(
            new AssemblyName("Kraftvaerk.DynamicSwaggerFilters"),
            AssemblyBuilderAccess.Run);
        var modBuilder = asmBuilder.DefineDynamicModule("DynamicFilters");
        var typeBuilder = modBuilder.DefineType(
            "BackOfficeSecurityFilter",
            TypeAttributes.Public | TypeAttributes.Class | TypeAttributes.Sealed,
            baseFilterType);

        var getter = typeBuilder.DefineMethod(
            "get_ApiName",
            MethodAttributes.Family | MethodAttributes.Virtual | MethodAttributes.HideBySig,
            typeof(string), Type.EmptyTypes);
        var il = getter.GetILGenerator();
        il.Emit(OpCodes.Ldstr, documentName);
        il.Emit(OpCodes.Ret);
        typeBuilder.DefineMethodOverride(getter, apiNameGetter);

        var dynamicFilterType = typeBuilder.CreateType();

        // Derive FilterDescriptor type from the OperationFilterDescriptors list
        var descriptorsProp = opts.GetType().GetProperty("OperationFilterDescriptors");
        if (descriptorsProp is null) return;

        var filterDescriptorType = descriptorsProp.PropertyType.GetGenericArguments().FirstOrDefault();
        if (filterDescriptorType is null) return;

        // Newer Swashbuckle uses a (Type, object[]) constructor; older uses settable properties
        object? descriptor = null;
        var typedCtor = filterDescriptorType.GetConstructors()
            .FirstOrDefault(c => c.GetParameters() is { Length: 2 } p && p[0].ParameterType == typeof(Type));

        if (typedCtor is not null)
            descriptor = typedCtor.Invoke([dynamicFilterType, Array.Empty<object>()]);
        else
        {
            descriptor = Activator.CreateInstance(filterDescriptorType);
            filterDescriptorType.GetProperty("Type")?.SetValue(descriptor, dynamicFilterType);
            filterDescriptorType.GetProperty("Arguments")?.SetValue(descriptor, Array.Empty<object>());
        }

        if (descriptor is null) return;
        (descriptorsProp.GetValue(opts) as System.Collections.IList)?.Add(descriptor);
    }
}

#endif
