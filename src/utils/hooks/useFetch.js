import { useContext, useEffect, useState } from "react"
import { getActions } from "../../actions/actions";
import { LoadingContext  } from "../providers/LoadingProvider";

export function useFetch(url) {
    const [data , setData] = useState([]);
    const [dataCopy , setDataCopy] = useState([]);
    const [error,  setError] = useState(false);
    const [isLoading,  setIsLoading] = useState(false);
    const [refetch , setRefetch] = useState(null);
    const {setLoadingProgress , setLoadingComplete } = useContext(LoadingContext);

    const onRefresh = () => {
        setRefetch(Date.now())
    }

    useEffect(() => {
        if(!url) return;
        setIsLoading(true)
        setLoadingProgress()
        const fetchData = async (route) => {
            await getActions(route)
            .then((response)=>{
                setData(response.data)
                setDataCopy(response.data)
            })
            .catch((error)=>{
                console.log(error)
                setError(true);
            })
            .finally(()=>{
                setIsLoading(false)
                setLoadingComplete()
            })
        }

        fetchData(url)
    
    }, [url , refetch])

    return {isLoading , error , data , dataCopy , setDataCopy , onRefresh }
    
}

export default useFetch