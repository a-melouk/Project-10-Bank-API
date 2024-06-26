import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import * as auth from "../authentication/auth-provider";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Error from "../components/Error";
import { getToken } from "../app/selectors";
import Spinner from "../components/Spinner";
import StyledButton from "../components/Button";

const StyledMain = styled.main`
  background-color: #dfe6ed;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledLogin = styled.section`
  box-sizing: border-box;
  background-color: white;
  width: 300px;
  margin: 3rem auto 0px;
  padding: 2rem;
  border-radius: 5px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 1rem;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 5px;
  font-size: 1.2rem;
`;

const StyledRememberDiv = styled.div`
  display: flex;
  align-items: center;
`;

const StyledRememberLabel = styled.label`
  margin-left: 0.25rem;
`;

const StyledSubmitButton = styled(StyledButton)`
  background-color: #00bc77;
  border-color: #00bc77;
  color: #fff;
  font-size: 1.1rem;
  gap: 8px;
  margin-top: 1rem;
  padding: 8px;
  text-decoration: underline;
`;

async function getUser(token) {
  const profile = await auth.getProfile(token);
  return profile.user;
}

function Login() {
  document.title = "Login";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(getToken);
  //used to check if a spinner is displayed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    username: null,
    password: null,
    other: null,
  });

  //if user token exists in local storage, redirect to profile page
  useEffect(() => {
    if (token) navigate("/profile");
  }, [token, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.target);
    const email = data.get("email");
    const password = data.get("password");
    const remember = data.get("remember");

    try {
      const token = await auth.login({ email, password });
      const user = await getUser(token);
      if (remember) {
        auth.setToken(token, "local");
        auth.setUser(user, "local");
      } else {
        auth.setToken(token, "session");
        auth.setUser(user, "session");
      }
      setLoading(false);

      dispatch({ type: "SET_TOKEN", payload: { token } });
      dispatch({ type: "SET_USER", payload: { user } });
      navigate("/profile");
    } catch (error) {
      setLoading(false);
      if (error.message === "Error: User not found!")
        setError({
          ...error,
          username: "User not found!",
        });
      else if (error.message === "Error: Password is invalid")
        setError({
          ...error,
          password: "Password is invalid",
        });
      else {
        setError({
          ...error,
          other: "An error occurred, please try again later",
        });
      }
    }
  }

  return (
    <StyledMain>
      <StyledLogin>
        <FontAwesomeIcon icon={faCircleUser} />
        <h1>Sign In</h1>
        <StyledForm onSubmit={handleSubmit}>
          <StyledInputWrapper>
            <StyledLabel htmlFor="email">Username</StyledLabel>
            <StyledInput type="email" id="email" name="email" required />
          </StyledInputWrapper>
          {error.username && <Error error={error.username} />}
          <StyledInputWrapper>
            <StyledLabel htmlFor="password">Password</StyledLabel>
            <StyledInput
              type="password"
              id="password"
              name="password"
              required
            />
          </StyledInputWrapper>
          {error.password && <Error error={error.password} />}
          <StyledRememberDiv>
            <input type="checkbox" id="remember" name="remember" />
            <StyledRememberLabel htmlFor="remember">
              Remember me
            </StyledRememberLabel>
          </StyledRememberDiv>
          {error.other && <Error error={error.other} />}
          <StyledSubmitButton type="submit">
            Sign In {loading && <Spinner />}
          </StyledSubmitButton>
        </StyledForm>
      </StyledLogin>
    </StyledMain>
  );
}

export default Login;
