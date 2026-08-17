import { useCallback, useEffect, useState } from "react";

/**
 * 화면 진입 시 한 번 호출하는 조회 API용 훅.
 *
 *   const { data, loading, error, reload } = useApiQuery(() => asCase.getEstimate(asNo), [asNo]);
 *
 * `deps` 가 바뀌면 다시 호출한다. 언마운트/재호출 시 이전 응답은 버린다.
 * 서버가 아직 없거나 실패하면 `error` 에 ApiError 가 담기므로, 화면은
 * 목데이터 대신 에러 상태를 그려야 한다.
 */
export function useApiQuery(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { ...state, reload };
}
