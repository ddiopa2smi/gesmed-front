import { useEffect, useState } from "react"
import { getActions } from "../../actions/actions";

export function useFetch(url) {
    const [data , setData] = useState([]);
    const [dataCopy , setDataCopy] = useState([]);
    const [error,  setError] = useState(false);
    const [isLoading,  setIsLoading] = useState(false);
    const [refetch , setRefetch] = useState(null);

    const onRefresh = () => {
        setRefetch(Date.now())
    }

    useEffect(() => {
        if(!url) return;
        setIsLoading(true)
        const fetchData = async (route) => {
            await getActions(route)
            .then((response)=>{
                setData(response.data)
                setDataCopy(response.data)
            })
            .catch((error)=>{
                setError(true);
            })
            .finally(()=>{
                setIsLoading(false)
            })
        }

        fetchData(url)
    
    }, [url , refetch])

    return {isLoading , error , data , dataCopy , setDataCopy , onRefresh }
    
}

export default useFetch