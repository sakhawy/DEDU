/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TagTagType, ModState } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetDetailedSummary
// ====================================================

export interface GetDetailedSummary_summaries_edges_node_tagSet_edges_node {
  __typename: "TagType";
  title: string;
  tagType: TagTagType;
}

export interface GetDetailedSummary_summaries_edges_node_tagSet_edges {
  __typename: "TagTypeEdge";
  /**
   * The item at the end of the edge
   */
  node: GetDetailedSummary_summaries_edges_node_tagSet_edges_node | null;
}

export interface GetDetailedSummary_summaries_edges_node_tagSet {
  __typename: "TagTypeConnection";
  /**
   * Contains the nodes in this connection.
   */
  edges: (GetDetailedSummary_summaries_edges_node_tagSet_edges | null)[];
}

export interface GetDetailedSummary_summaries_edges_node_user {
  __typename: "UserType";
  name: string | null;
  profilePicture: string | null;
}

export interface GetDetailedSummary_summaries_edges_node_mod {
  __typename: "ModType";
  /**
   * The ID of the object.
   */
  id: string;
  state: ModState;
}

export interface GetDetailedSummary_summaries_edges_node {
  __typename: "SummaryType";
  /**
   * The ID of the object.
   */
  id: string;
  title: string;
  body: string;
  created: any;
  voteCount: number | null;
  userVote: string | null;
  tagSet: GetDetailedSummary_summaries_edges_node_tagSet | null;
  user: GetDetailedSummary_summaries_edges_node_user;
  mod: GetDetailedSummary_summaries_edges_node_mod;
}

export interface GetDetailedSummary_summaries_edges {
  __typename: "SummaryTypeEdge";
  /**
   * The item at the end of the edge
   */
  node: GetDetailedSummary_summaries_edges_node | null;
}

export interface GetDetailedSummary_summaries {
  __typename: "SummaryTypeConnection";
  /**
   * Contains the nodes in this connection.
   */
  edges: (GetDetailedSummary_summaries_edges | null)[];
}

export interface GetDetailedSummary {
  summaries: GetDetailedSummary_summaries | null;
}

export interface GetDetailedSummaryVariables {
  id?: string | null;
}
