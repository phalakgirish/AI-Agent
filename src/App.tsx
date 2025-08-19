// all routes
import Routes from './routes/Routes';

// helpers
import { configureFakeBackend } from './helpers';

// For Default import Theme.scss
import './assets/scss/Theme.scss';
import { ToastContainer , toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
    configureFakeBackend();
    return(
        <>
        <Routes />;
        <ToastContainer />
        </>
    )
    
};

export default App;
