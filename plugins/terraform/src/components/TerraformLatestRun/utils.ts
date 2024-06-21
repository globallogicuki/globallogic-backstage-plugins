import { Entity } from "@backstage/catalog-model";
import { TERRAFORM_WORKSPACE_ANNOTATION, TERRAFORM_WORKSPACE_ORGANIZATION } from "../../annotations";

export const getAnnotations = (entity: Entity): { organization?: string, workspace?: string } => {
    const organization = entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ORGANIZATION];
    const workspace = entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ANNOTATION];
    return { organization, workspace };
}