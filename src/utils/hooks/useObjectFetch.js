import { useContext, useEffect, useState } from "react"
import { getActions } from "../../actions/actions";
import { LoadingContext } from "../providers/LoadingProvider";
import { message } from "antd";

export function useObjectFetch(url) {
    const [data, setData] = useState(null);
    const [dataCopy, setDataCopy] = useState(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [refetch, setRefetch] = useState(null);
    const { setLoadingProgress, setLoadingComplete } = useContext(LoadingContext);
    const onRefresh = () => {
        setRefetch(Date.now())
    }

    useEffect(() => {
        if (!url) return;
        setIsLoading(true)
        setLoadingProgress()
        const fetchData = async (route) => {
            await getActions(route)
                .then((response) => {
                    setData(response.data)
                    setDataCopy(response.data)
                })
                .catch((error) => {
                    message.error(error.message);
                    setError(true);
                })
                .finally(() => {
                    setIsLoading(false)
                    setLoadingComplete()
                })
        }

        fetchData(url)

    }, [url, refetch])

    return { isLoading, data, error, dataCopy, setDataCopy, onRefresh }

}

export default useObjectFetch