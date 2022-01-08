import { FunctionComponent } from "react";
import { Routes, Route } from "react-router-dom";
import Global from "./components/Global";

import SearchPage from "./pages/SearchPage";
import UserPage from "./pages/UserPage";

const App: FunctionComponent = () => {
  return (
    <>
      <Global />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>
    </>
  );
};

export default App;
