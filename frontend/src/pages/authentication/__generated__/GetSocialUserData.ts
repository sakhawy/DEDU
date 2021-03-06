/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: GetSocialUserData
// ====================================================

export interface GetSocialUserData_socialAuth_social_user {
  __typename: "UserType";
  /**
   * The ID of the object.
   */
  id: string;
  name: string | null;
  profilePicture: string | null;
}

export interface GetSocialUserData_socialAuth_social {
  __typename: "SocialNode";
  user: GetSocialUserData_socialAuth_social_user;
}

export interface GetSocialUserData_socialAuth {
  __typename: "ExtendedSocialAuthJWTPayload";
  token: string | null;
  social: GetSocialUserData_socialAuth_social | null;
}

export interface GetSocialUserData {
  socialAuth: GetSocialUserData_socialAuth | null;
}

export interface GetSocialUserDataVariables {
  accessToken: string;
  name?: string | null;
  profilePicture?: string | null;
}
