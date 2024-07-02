import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishedScreen from "./FinishedScreen";
import Footer from "./Footer";
import Timer from "./Timer";

const SEC_PER_QUESTION = 30;

const initialState = {
  questions: [],

  // 'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
    case "start":
      return {
        ...state,
        status: "active",
        secondRemaining: state.questions.length * SEC_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...initialState, questions: state.questions, status: "ready" };
    // return {
    //   ...state,
    //   points: 0,
    //   highscore: 0,
    //   index: 0,
    //   answer: null,
    //   status: "ready",
    // };

    case "tick":
      return {
        ...state,
        secondRemaining: state.secondRemaining - 1,
        status: state.secondRemaining === 0 ? "finished" : state.status,
      };

    default:
      throw new Error("action unknown");
  }
}

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    questions,
    status,
    index,
    answer,
    points,
    highscore,
    secondRemaining,
  } = state;

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  useEffect(function () {
    fetch(`http://localhost:8000/questions`)
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Header />

      <Main className="main">
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestion={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
              points={points}
            />
            <Footer>
              <Timer dispatch={dispatch} secondRemaining={secondRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestion={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishedScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );

  // const [value, setValue] = useState(1);
  // const [fromCur, setFromCur] = useState("GBP");
  // const [toCur, setToCur] = useState("USD");
  // const [newCur, setNewCur] = useState("");
  // const [load, setLoad] = useState(false);

  // useEffect(function () {
  //   async function convert() {
  //     setLoad(true);
  //     const res = await fetch(
  //       `https://api.frankfurter.app/latest?amount=${value}&from=${fromCur}&to=${toCur}`
  //     );
  //     const data = await res.json();
  //     setNewCur(data.rates[toCur]);
  //     setLoad(false);
  //     console.log(data);
  //   }

  //   convert();
  // });

  // if (fromCur === toCur) return;

  // return (
  //   <div>
  //     <input
  //       type="text"
  //       value={value}
  //       onChange={(e) => setValue(e.target.value)}
  //       placeholder="type something"
  //       disabled={load}
  //     />
  //     <select
  //       value={fromCur}
  //       disabled={load}
  //       onChange={(e) => setFromCur(e.target.value)}
  //     >
  //       <option>AUD</option>
  //       <option>CAD</option>
  //       <option>JPY</option>
  //       <option>GBP</option>
  //       <option>NZD</option>
  //       <option>USD</option>
  //       <option>BRL</option>
  //       <option>EUR</option>
  //     </select>
  //     <select
  //       value={toCur}
  //       disabled={load}
  //       onChange={(e) => setToCur(e.target.value)}
  //     >
  //       <option>USD</option>
  //       <option>AUD</option>
  //       <option>CAD</option>
  //       <option>JPY</option>
  //       <option>GBP</option>
  //       <option>NZD</option>
  //       <option>BRL</option>
  //     </select>
  //     <p>{newCur}</p>
  //   </div>
  // );
};

export default App;
