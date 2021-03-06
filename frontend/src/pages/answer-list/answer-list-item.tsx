import { useReactiveVar } from "@apollo/client"
import classNames from "classnames"
import React from "react"
import { Link, useLocation } from "react-router-dom"
import { currentCourseVar, currentUserVar } from "../../common/apollo-client/apollo-client"
import TextEditor from "../../common/components/text-editor/text-editor"
import Vote from "../../common/components/vote/vote"

import { GetQuestionAnswers_answers_edges_node } from "./__generated__/GetQuestionAnswers"

const arTimeAgo = require('artimeago')

interface Props {
	answer: GetQuestionAnswers_answers_edges_node 
	editableAnswerId?: string
	setEditableAnswerId?: (value: React.SetStateAction<string>) => void
}

const AnswerListItem: React.FC<Props> = ({ answer, editableAnswerId, setEditableAnswerId }) => {

	const location = useLocation()

	const currentUser = useReactiveVar(currentUserVar)
	const currentCourse = useReactiveVar(currentCourseVar)

	return (

		<div
			className={classNames("grid grid-cols-1", {
				"border-r border-primary pr-1": currentUser?.name === answer?.user.name 
			})}
		>
			{currentUser?.name === answer?.user.name && 
				<div
					className="w-full flex flex-row items-center justify-start gap-1"
				>
					<button
						className="bg-primary-100 py-1 px-2 rounded-t-lg text-sm md:text-base"
						onClick={() => {
							setEditableAnswerId && setEditableAnswerId(editableAnswerId === answer?.id! ? "" : answer?.id!)
						}}
					>
						تعديل
					</button>
					<p
						className={classNames("py-1 px-2 rounded-t-lg text-sm md:text-base", {
							"bg-yellow-300 text-secondary": answer?.mod?.state === "PENDING",
							//"bg-green-600": answer?.mod?.state === "APPROVED",
							"bg-red-800 text-secondary-100": answer?.mod?.state === "REJECTED",
							
						})}
					>
						{answer?.mod?.state === "PENDING" && "قيد المراجعة"}
						{answer?.mod?.state === "REJECTED" && "مرفوض"}
					</p>
				</div>}
			<div
				className={classNames("bg-secondary-100 flex flex-col gap-1 p-1 rtl text-secondary", 
				{
					"rounded-tl-lg rounded-b-lg": currentUser?.name === answer?.user.name,
					"rounded-lg": currentUser?.name !== answer?.user.name,
				})}
			>
				{/* upper part */}
				<div
					className="flex-grow flex flex-row gap-1 p-1 items-start"
				>
			
					{/* title + user data */}
					<div
						className="flex flex-col items-start justify-center gap-1 w-14 md:w-36"
					>
						<Vote
							contentId={answer?.id}
							voteCount={answer?.voteCount!}
							userVote={answer?.userVote!}
						/>
						<div
							className="w-full flex flex-col items-start justify-center gap-1"
						>
							<div
								className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full overflow-hidden"
							>
								<img src={answer?.user.profilePicture!} alt="" />
							</div>
							<p
								className="font-semibold text-sm md:text-base w-full whitespace-pre-wrap truncate"
							>
								{answer?.user?.name}
							</p>
							<p
								className="flex items-center gap-1 md:gap-2 flex-wrap"
							>
								منذ <span className="text-primary text-sm md:text-base font-bold">{arTimeAgo({date: new Date(answer?.created).getTime()}).split('منذ')[1]}</span>
							</p>
						</div>
					</div>
					<div
						className="w-5/6 pr-4"
					>
						<TextEditor
							readonly={true}
							value={answer?.body}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnswerListItem;