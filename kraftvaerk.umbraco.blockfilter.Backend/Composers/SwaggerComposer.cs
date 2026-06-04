using System.Linq.Expressions;
using System.Reflection;
using System.Runtime.CompilerServices;
using kraftvaerk.umbraco.blockfilter.Backend.PackageConstants;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;

#if !NET10_0_OR_GREATER
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Management.OpenApi;
#endif

namespace kraftvaerk.umbraco.blockfilter.Backend.Composers;

public class SwaggerComposer : IComposer
{
#if !NET10_0_OR_GREATER
    private class MyBackOfficeSecurityRequirementsOperationFilter : BackOfficeSecurityRequirementsOperationFilterBase
    {
        protected override string ApiName => $"{BlockFilterConstants.ApiName}-api-v1";
    }

    private class MyConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc($"{BlockFilterConstants.ApiName}-api-v1", new OpenApiInfo { Title = "Kraftvaerk Blockfilter v1", Version = "1.0" });
            options.OperationFilter<MyBackOfficeSecurityRequirementsOperationFilter>();
        }
    }
#endif

    public void Compose(IUmbracoBuilder builder)
    {
#if NET10_0_OR_GREATER
        // The net10.0 build serves both Umbraco 17 (Swashbuckle) and 18+ (Microsoft.AspNetCore.OpenApi).
        // Both paths use pure reflection / Expression.Lambda so no Swashbuckle or v18-specific type
        // tokens ever appear in class declarations or method signatures — preventing TypeLoadException
        // during Umbraco's assembly type scan on whichever version is running.
        if (IsSwashbucklePresent())
            RegisterSwashbuckle(builder);
        else
            RegisterNewOpenApi(builder);
#else
        builder.Services.ConfigureOptions<MyConfigureSwaggerGenOptions>();
#endif
    }

#if NET10_0_OR_GREATER

    private static bool IsSwashbucklePresent() =>
        Type.GetType("Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions, Swashbuckle.AspNetCore.SwaggerGen") is not null;

    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void RegisterSwashbuckle(IUmbracoBuilder builder)
    {
        var swaggerGenOptionsType = Type.GetType(
            "Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions, Swashbuckle.AspNetCore.SwaggerGen");
        if (swaggerGenOptionsType is null) return;

        // OptionsServiceCollectionExtensions.Configure<T>(IServiceCollection, Action<T>)
        var configureMethod = typeof(OptionsServiceCollectionExtensions)
            .GetMethods(BindingFlags.Static | BindingFlags.Public)
            .FirstOrDefault(m => m.Name == "Configure"
                && m.IsGenericMethod
                && m.GetParameters().Length == 2
                && m.GetParameters()[0].ParameterType == typeof(IServiceCollection));
        if (configureMethod is null) return;

        // Action<SwaggerGenOptions>: opts => ApplySwaggerGenOptions(opts)
        // ApplySwaggerGenOptions takes 'object' — zero Swashbuckle tokens in any IL method signature.
        var param = Expression.Parameter(swaggerGenOptionsType, "opts");
        var applyMethod = typeof(SwaggerComposer)
            .GetMethod(nameof(ApplySwaggerGenOptions), BindingFlags.Static | BindingFlags.NonPublic)!;

        var action = Expression.Lambda(
            Expression.GetActionType(swaggerGenOptionsType),
            Expression.Call(applyMethod, Expression.Convert(param, typeof(object))),
            param).Compile();

        configureMethod.MakeGenericMethod(swaggerGenOptionsType)
            .Invoke(null, [builder.Services, action]);
    }

    private static void ApplySwaggerGenOptions(object opts)
    {
        var apiName = BlockFilterConstants.ApiName + "-api-v1";

        var openApiInfoType = Type.GetType("Microsoft.OpenApi.Models.OpenApiInfo, Microsoft.OpenApi.Models");
        if (openApiInfoType is null) return;

        var info = Activator.CreateInstance(openApiInfoType)!;
        openApiInfoType.GetProperty("Title")?.SetValue(info, "Kraftvaerk Blockfilter v1");
        openApiInfoType.GetProperty("Version")?.SetValue(info, "1.0");

        opts.GetType().GetMethod("SwaggerDoc", [typeof(string), openApiInfoType])
            ?.Invoke(opts, [apiName, info]);
    }

    [MethodImpl(MethodImplOptions.NoInlining)]
    private static void RegisterNewOpenApi(IUmbracoBuilder builder)
    {
        var apiName = BlockFilterConstants.ApiName + "-api-v1";

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

        // Action<BackOfficeOpenApiDocumentBuilder>: doc => ApplyDocBuilder(doc)
        var param = Expression.Parameter(docBuilderType, "doc");
        var applyMethod = typeof(SwaggerComposer)
            .GetMethod(nameof(ApplyDocBuilder), BindingFlags.Static | BindingFlags.NonPublic)!;

        var action = Expression.Lambda(
            Expression.GetActionType(docBuilderType),
            Expression.Call(applyMethod, Expression.Convert(param, typeof(object))),
            param).Compile();

        addDocMethod.Invoke(null, [builder, apiName, action]);
    }

    private static void ApplyDocBuilder(object docBuilder)
    {
        var type = docBuilder.GetType();

        // WithTitle — returns 'this' for fluent chaining
        var afterTitle = type.GetMethod("WithTitle", [typeof(string)])
            ?.Invoke(docBuilder, ["Kraftvaerk Blockfilter v1"]) ?? docBuilder;

        var configureMethod = afterTitle.GetType().GetMethod("ConfigureOpenApiOptions");
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

        configureMethod.Invoke(afterTitle, [secAction]);
    }

#endif
}
