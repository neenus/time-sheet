import "./App.css";
import EmployeeForm from "./components/form/employee-form.component";
import Footer from "./components/footer/footer.component";

function App() {
  return (
    <div className="App">
      <h1>Time Sheet App</h1>
      <EmployeeForm />
      <Footer />
    </div>
  );
}

export default App;
