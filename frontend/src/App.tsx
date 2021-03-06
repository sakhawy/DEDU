import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client'

import apolloClient from "./common/apollo-client/apollo-client"
import CoursePage from './pages/course-page/course-page'
import LectureListingPage from './pages/lecture-listing-page/lecture-listing-page'
import QuestionListingPage from './pages/question-listing-page/question-listing-page';
import ResourceListingPage from './pages/resource-listing-page/resource-listing-page';
import SummaryListingPage from './pages/summary-listing-page/summary-listing-page';
import ResourceCreationPage from './pages/resource-creation-page/resource-creation-page';
import SummaryCreationPage from './pages/summary-creation-page/summary-creation-page';
import QuestionCreationPage from './pages/question-creation-page/question-creation-page';
import GenericDetail from './common/components/generic-detail/generic-detail';
import SummaryDetail from './pages/summary-detail/summary-detail';
import ResourceDetail from './pages/resource-detail/resource-detail';
import QuestionDetail from './pages/question-detail/question-detail';
import QuestionEdit from './pages/question-edit/question-edit';
import ResourceEdit from './pages/resource-edit/resource-edit';
import SummaryEdit from './pages/summary-edit/summary-edit';
import Authenticate from './pages/authentication/authenticate';
import ProtectedRoute from './common/components/protected-route/protected-route';
import Navbar from './common/components/navbar/navbar';
import LectureDetail from './pages/lecture-detail/lecture-detail';
import QuizListingPage from './pages/quiz-listing-page/quiz-listing-page';
import QuizCreationPage from './pages/quiz-creation-page/quiz-creation-page';
import QuizEdit from './pages/quiz-edit/quiz-edit';
import Logout from './pages/logout/logout';
import QuizDetail from './pages/quiz-detail/quiz-detail';
import BackgroundIcons from './common/components/background-icons/background-icons';


// I DON'T BELIEVE IN REDUNDANCY LOL

const App: React.FC = () => {

	return (
		<div
			className="flex-1 font-cairo w-full relative"
		>
			<BackgroundIcons />

			<ApolloProvider client={ apolloClient }>
				<Router>

					<div
						className="pb-16"
					>
						<Navbar />
					</div>

					<Switch>
						<Route path="/auth/">
							<Authenticate />
						</Route>
						<Route path="/logout/">
							<Logout />
						</Route>

						<Route path="/courses/:course/resource/detail/:id/">
							<ResourceDetail />
						</Route>
						<Route path="/courses/:course/quiz/detail/">
							<QuizDetail /> 
						</Route>
						<Route path="/courses/:course/summary/detail/:id/">
							<SummaryDetail /> 
						</Route>
						<Route path="/courses/:course/question/detail/:id/">
							<QuestionDetail />
						</Route>
						<Route path="/courses/:course/lecture/detail/:id/">
							<LectureDetail />
						</Route>

						<ProtectedRoute path="/courses/:course/question/edit/:id/">
							<QuestionEdit />
						</ProtectedRoute>
						<ProtectedRoute path="/courses/:course/resource/edit/:id/">
							<ResourceEdit />
						</ProtectedRoute>
						<ProtectedRoute path="/courses/:course/summary/edit/:id/">
							<SummaryEdit />
						</ProtectedRoute>
						<ProtectedRoute path="/courses/:course/quiz/edit/:id/">
							<QuizEdit />
						</ProtectedRoute>

						<Route path="/courses/:course/lecture/">
							<LectureListingPage />
						</Route>
						
						<ProtectedRoute path="/courses/:course/question/create">
							<QuestionCreationPage />
						</ProtectedRoute>
						<ProtectedRoute path="/courses/:course/summary/create">
							<SummaryCreationPage />
						</ProtectedRoute>
						<ProtectedRoute path="/courses/:course/resource/create">
							<ResourceCreationPage />
						</ProtectedRoute>
						<ProtectedRoute path="/courses/:course/quiz/create">
							<QuizCreationPage />
						</ProtectedRoute>

						<Route path="/courses/:course/question/">
							<QuestionListingPage />
						</Route>
						<Route path="/courses/:course/summary/">
							<SummaryListingPage />
						</Route>
						<Route path="/courses/:course/quiz/">
							<QuizListingPage />
						</Route>
						<Route path="/courses/:course/resource/">
							<ResourceListingPage />
						</Route>
						<Route path={["/courses/", "/"]}>
							<CoursePage />
						</Route>
					</Switch>
				</Router>

			</ApolloProvider>
		</div>
	);
}

export default App;
