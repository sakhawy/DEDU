import React, { useState } from "react"
import { gql, useQuery } from "@apollo/client"
import { useParams } from "react-router"
import MiniLectureListing from "./mini-lecture-listing"
import { GetDetailedLecture } from "./__generated__/GetDetailedLecture"
import LectureDetailMain from "./lecture-detail-main"
import Concepts from "./concepts"
import QuestionList from "../question-listing-page/question-list"
import Loading from "../../common/components/loading/loading"

interface Props {

}

const GET_DETAILED_LECTURE = gql`
	query GetDetailedLecture($id: ID!, $courseCode: String!){
		lectures(id: $id){
			edges {
				node {
					id
					title
					body
					attachmentSet {
						edges {
							node {
								url
								attmType
								title
							}
						}
					}
					tagSet(course_Code: $courseCode, tagType: "CONCEPT") {
						edges {
							node {
								title
								tagType
							}
						}
					}
					teachers {
						edges {
							node {
								title
							}
						}
					}
				}
			}
		}
	}
` 

const LectureDetail: React.FC<Props> = () => {
	
	const [id, setId] = useState<string | null>(useParams<{id: string}>().id )
	const courseCode = useParams<{course: string}>().course

	const { loading, error, data } = useQuery<GetDetailedLecture>(GET_DETAILED_LECTURE, {
		variables: {
			id: id,
			courseCode: courseCode
		}
	})

	return (
		<div
			className="w-full flex flex-col items-center justify-center rtl text-secondary p-8"
		>
			{/* 3 Sections: MiniLectureList, Lecture media, concepts */}
			<div
				className="w-full flex-grow flex flex-row flex-wrap md:flex-nowrap items-start justify-center gap-2 md:gap-8"
			>
				<div
					className="relative flex-grow md:w-1/6 order-1 md:order-1 h-full"
				>
					{loading && <Loading />}
					<div
						className="rtl border-b border-primary mb-1"
					>
						<p
							className="text-xl text-primary mb-1"
						>
							تنقل
						</p>
					</div>
					<MiniLectureListing 
						id={id}
						setId={setId}
					/>
				</div>
				<div
					className="relative flex-grow order-3 md:order-2 md:w-4/6 h-full flex flex-col items-center justify-center gap-8"
				>
					{loading && <Loading />}
					<LectureDetailMain lecture={data?.lectures?.edges[0]?.node!}/>

					{data?.lectures?.edges[0]?.node?.tagSet?.edges?.length! > 0 && <div
						className="h-full w-full"
					>
						<div
							className="rtl border-b border-primary mb-1"
						>
							<p
								className="text-xl text-primary mb-1"
							>
								أسئلة على المحاضرة
							</p>
						</div>

						{/* rounded hack */}
						<div
						>
							<QuestionList 
								tags={data?.lectures?.edges[0]?.node?.tagSet?.edges.map(edge => edge?.node?.title!) || []}
							/>
						</div>
					</div>}	
				</div>
				<div
					className="relative flex-grow md:w-1/6 order-2 md:order-3 h-full"
				>
					{loading && <Loading />}
					<div
						className="rtl border-b border-primary mb-1"
					>
						<p
							className="text-xl text-primary mb-1"
						>
							المفاهيم
						</p>
					</div>
					<Concepts tags={data?.lectures?.edges[0]?.node?.tagSet!}/>
				</div>
			</div>
		</div>
	)
}

export default LectureDetail