import React, { useState } from "react"
import GenericListingPage from "../../common/components/generic-listing-page/generic-listing-page";

import ResourceList from "./resource-list";

interface Props {

}

const ResourceListingPage: React.FC<Props> = () => {

	const [tags, setTags] = useState<string[] | null>([])
	
	return (
		<div
			className="w-full h-full"
		>
			<GenericListingPage 
				tags={tags}
				setTags={setTags}
				ListHeader={{
					creationPath: "resource",
					creationText: "مشاركة مصدر"
				}}
			>
				<ResourceList tags={tags} />
			</GenericListingPage>
		</div>
	)
}

export default ResourceListingPage;