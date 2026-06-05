#if NET10_0_OR_GREATER

using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using Umbraco.Cms.Core.Composing;

namespace kraftvaerk.umbraco.blockfilter.Backend.OpenApi;

public static partial class UmbracoBackOfficeOpenApi
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void RegisterNewOpenApi(IUmbracoBuilder builder, BackOfficeApiDocumentOptions document)
    {
        Type? extType = null;
        foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
        {
            try { extType = asm.GetType("Umbraco.Cms.Api.Common.OpenApi.UmbracoBuilderOpenApiExtensions"); }
            catch { /* skip assemblies that throw on GetType */ }
            if (extType is not null) break;
        }

        var addDocMethod = extType?.GetMethods(BindingFlags.Static | BindingFlags.Public)
            .FirstOrDefault(m => m.Name == "AddBackOfficeOpenApiDocument" && m.GetParameters().Length == 3);
        if (addDocMethod is null) return;

        var docBuilderType = addDocMethod.GetParameters()[2].ParameterType.GetGenericArguments()[0];
        var param = Expression.Parameter(docBuilderType, "doc");
        var applyMethod = typeof(UmbracoBackOfficeOpenApi)
            .GetMethod(nameof(ApplyDocBuilder), BindingFlags.Static | BindingFlags.NonPublic)!;

        var action = Expression.Lambda(
            Expression.GetActionType(docBuilderType),
            Expression.Call(applyMethod,
                Expression.Convert(param, typeof(object)),
                Expression.Constant(document)),
            param).Compile();

        addDocMethod.Invoke(null, [builder, document.DocumentName, action]);
    }

    private static void ApplyDocBuilder(object docBuilder, BackOfficeApiDocumentOptions doc)
    {
        var current = docBuilder;

        // Apply each With* method if the builder exposes it; fluent chain returns 'this'.
        current = TryInvokeWith(current, "WithTitle", doc.Title) ?? current;
        if (doc.Description is not null)
            current = TryInvokeWith(current, "WithDescription", doc.Description) ?? current;
        if (doc.ContactName is not null)
            current = TryInvokeWith(current, "WithContactName", doc.ContactName) ?? current;
        if (doc.ContactEmail is not null)
            current = TryInvokeWith(current, "WithContactEmail", doc.ContactEmail) ?? current;
        if (doc.ContactUrl is not null)
            current = TryInvokeWith(current, "WithContactUrl", doc.ContactUrl) ?? current;
        if (doc.LicenseName is not null)
            current = TryInvokeWith(current, "WithLicenseName", doc.LicenseName) ?? current;
        if (doc.LicenseUrl is not null)
            current = TryInvokeWith(current, "WithLicenseUrl", doc.LicenseUrl) ?? current;

        ApplySecurityRequirements(current);
    }

    private static object? TryInvokeWith(object target, string methodName, object arg)
    {
        var method = target.GetType().GetMethod(methodName, [arg.GetType()]);
        return method?.Invoke(target, [arg]);
    }

    private static void ApplySecurityRequirements(object docBuilder)
    {
        var configureMethod = docBuilder.GetType().GetMethod("ConfigureOpenApiOptions");
        if (configureMethod is null) return;

        var optsType = configureMethod.GetParameters()[0].ParameterType.GetGenericArguments()[0];

        Type? secExtType = null;
        foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
        {
            try { secExtType = asm.GetType("Umbraco.Cms.Api.Management.OpenApi.OpenApiOptionsExtensions"); }
            catch { }
            if (secExtType is not null) break;
        }

        var addSecMethod = secExtType?.GetMethod("AddBackofficeSecurityRequirements",
            BindingFlags.Static | BindingFlags.Public);
        if (addSecMethod is null) return;

        var optsParam = Expression.Parameter(optsType, "opts");
        var secAction = Expression.Lambda(
            Expression.GetActionType(optsType),
            Expression.Call(addSecMethod, optsParam),
            optsParam).Compile();

        configureMethod.Invoke(docBuilder, [secAction]);
    }
}

#endif
