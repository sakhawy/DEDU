import React from "react"
import { useParams } from "react-router"
import { gql, useQuery } from "@apollo/client"

import { DetailedParams } from "../../common/interfaces/params" 
import { GetDetailedQuestion } from "./__generated__/GetDetailedQuestion"
import GenericDetail from "../../common/components/generic-detail/generic-detail"
import Loading from "../../common/components/loading/loading"
import AnswerList from "../answer-list/answer-list"

interface Props {

}

const GET_DETAILED_QUESTION = gql`
	query GetDetailedQuestion($id: ID) {
		questions(id: $id) {
			edges {
				node {
					id
					title
					body
					created
					voteCount
					userVote
					tagSet {
						edges {
							node {
								title
								tagType
							}
						}
					}
					user {
						name
						profilePicture
					}
				}
			}
		}
	}
`

const QuestionDetail: React.FC<Props> = () => {
	
	const { course: courseCode, id } = useParams<DetailedParams>()
	const { loading, error, data } = useQuery<GetDetailedQuestion>(GET_DETAILED_QUESTION, {
		variables: {
			id: id
		}
	})
	const question = data?.questions?.edges[0]?.node

	return (
		<div
			className="grid grid-cols-1 gap-8 relative p-8"
		>
			{loading && <Loading />}

			<div
				className="rounded-lg overflow-hidden"
			>
				<GenericDetail
					content={question!}
				/>
			</div>
			<div
				className="px-8"
			>
				<AnswerList questionId={question?.id!}/>
			</div>
		</div>
	)
}

export default QuestionDetail