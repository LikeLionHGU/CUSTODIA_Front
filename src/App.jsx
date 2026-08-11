import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <header/>

      <main>
        <Outlet />
      </main>

      <footer/>
    </>
  );
}