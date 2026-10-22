import { useContext, useEffect, useState } from "react"
import { getActions } from "../../actions/actions";
import { LoadingContext } from "../providers/LoadingProvider";

/**
 * Pour les endpoints paginés côté serveur qui répondent au format
 * { content: [...], totalElements, totalPages, page, size }.
 * Contrairement à useFetch (qui attend un tableau brut), ce hook expose
 * directement `content` et les métadonnées de pagination.
 */
export function usePaginatedFetch(url) {
    const [content, setContent] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
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
        getActions(url)
            .then((response) => {
                setContent(response?.data?.content || []);
                setTotalElements(response?.data?.totalElements || 0);
                setTotalPages(response?.data?.totalPages || 0);
            })
            .catch((error) => {
                console.log(error)
                setError(true);
            })
            .finally(() => {
                setIsLoading(false)
                setLoadingComplete()
            })
    }, [url, refetch])

    return { isLoading, error, content, totalElements, totalPages, onRefresh }
}

export default usePaginatedFetch
