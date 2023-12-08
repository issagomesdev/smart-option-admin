import { useAuth } from "src/providers/AuthContext"
import HomePage from "../layouts/components/pages/home";
import LoginPage from "../layouts/components/pages/login";

const Start = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {
        isAuthenticated? <HomePage/> : <LoginPage/>
      }
    </div>
  )
}

export default Start
