import "./App.css";
import {createBrowserRouter, RouterProvider, Outlet} from "react-router-dom";
import MessageBoard from "./MessageBoard.tsx";
import Welcome from "./Welcome.tsx";
import AllPosts from "./AllPosts.tsx";
import PostView from "./PostView.tsx";
import NavBar from "./NavBar.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        path: "",
        element: <MessageBoard/>,
        children: [
          {
            path: ":pageNumber",
            element: <AllPosts/>,
          },
          {
            path: "post/:postId",
            element: <PostView/>,
          }
        ],
      },
      {
        path: "welcome",
        element: <Welcome/>,
      }
    ],
  },
])


function App() {
  return <RouterProvider router={router}/>;
}

export default App;


function Layout() {
  return <>
    <NavBar/>
    <Outlet/>
  </>
}