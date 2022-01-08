import { FunctionComponent, useEffect, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Global from "./components/Global";

import User from "./components/User";
import SearchPage from "./pages/SearchPage";
import UserPage from "./pages/UserPage";

const App: FunctionComponent = () => {
  return (
    <>
      <Global />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="users/:userId" element={<UserPage />} />
      </Routes>
    </>
  );
};

export default App;
