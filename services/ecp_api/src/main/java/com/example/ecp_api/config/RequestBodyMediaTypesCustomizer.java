package com.example.ecp_api.config;

import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

/** Standardizes request body media types in the default document and every Swagger group. */
@Component
public class RequestBodyMediaTypesCustomizer implements GlobalOpenApiCustomizer {
    @Override
    public void customise(OpenAPI openApi) {
        if (openApi.getPaths() == null) return;
        openApi.getPaths().values().forEach(path -> path.readOperations().forEach(operation -> {
            var body = operation.getRequestBody();
            if (body == null || body.getContent() == null || body.getContent().isEmpty()
                    || body.getContent().containsKey(MediaType.MULTIPART_FORM_DATA_VALUE)) return;

            var json = body.getContent().get(MediaType.APPLICATION_JSON_VALUE);
            if (json == null) json = body.getContent().values().iterator().next();
            if (json.getSchema() == null) return;
            var form = new io.swagger.v3.oas.models.media.MediaType()
                    .schema(formSchema(json.getSchema(), openApi));
            body.setContent(new Content()
                    .addMediaType(MediaType.APPLICATION_JSON_VALUE, json)
                    .addMediaType(MediaType.APPLICATION_FORM_URLENCODED_VALUE, form));
        }));
    }

    private Schema<?> formSchema(Schema<?> source, OpenAPI openApi) {
        Schema<?> resolved = resolve(source, openApi);
        if (resolved.getProperties() == null) return source;
        ObjectSchema form = new ObjectSchema();
        form.setRequired(resolved.getRequired());
        form.setDescription(resolved.getDescription());
        resolved.getProperties().forEach((name, property) -> {
            Schema<?> actual = resolve(property, openApi);
            if (actual.getProperties() != null || actual.getItems() != null || actual.getAdditionalProperties() != null
                    || "object".equals(actual.getType()) || "array".equals(actual.getType())) {
                // Swagger sends strings for these fields; the converter decodes their JSON values.
                StringSchema text = new StringSchema();
                String description = property.getDescription() != null ? property.getDescription() : actual.getDescription();
                text.setDescription((description == null ? "" : description + ". ")
                        + "Enter a JSON " + (actual.getItems() != null ? "array" : "object") + ".");
                Object example = property.getExample() != null ? property.getExample() : actual.getExample();
                if (example != null) text.setExample(example instanceof String ? example : Json.pretty(example));
                form.addProperty(name, text);
            } else {
                form.addProperty(name, property);
            }
        });
        return form;
    }

    private Schema<?> resolve(Schema<?> schema, OpenAPI openApi) {
        String prefix = "#/components/schemas/";
        if (schema.get$ref() != null && schema.get$ref().startsWith(prefix)
                && openApi.getComponents() != null && openApi.getComponents().getSchemas() != null) {
            Schema<?> resolved = openApi.getComponents().getSchemas().get(schema.get$ref().substring(prefix.length()));
            if (resolved != null) return resolved;
        }
        return schema;
    }
}
