import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./components/AppRouter";
import { Provider } from "./provider/theme-provider";
import Loader from "./components/loader/Loader";
import Nav from "./components/Navbar";
import Layout from "./components/ui/layout/Layout";





function App() {
  return (
    <>
      <Provider>
        <BrowserRouter>
          <React.Suspense fallback={<Loader />}>
            <Layout>
              <AppRouter />
            </Layout>
          </React.Suspense>
        </BrowserRouter>
      </Provider>



    </>
  );
}

export default App