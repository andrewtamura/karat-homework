import { useRouteError } from "react-router-dom";


const NotFound: React.FC = () => {
    const error = useRouteError();
    
    return (
        <div>
            <div>Not found</div>
        </div>
    )
}

export default NotFound;