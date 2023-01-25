import { useRouteError } from "react-router-dom";


const NotFound: React.FC = () => {
    const error = useRouteError();
    console.error(error);
  
    return (
            <div>Not found</div>
    )
}

export default NotFound;