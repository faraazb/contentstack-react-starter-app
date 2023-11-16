import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import RenderComponents from "../components/render-components";
import { getPageRes } from "../helper";
import Skeleton from "react-loading-skeleton";
import { useLivePreviewCtx } from "../context/live-preview-context-provider";
import { EntryProps } from "../typescript/components";
import { Page } from "../typescript/pages";

export default function Home({ entry }:{entry:({page, blogPost}:EntryProps)=> void}) {
  // home page
  const lpTs = useLivePreviewCtx();
  const params = useParams();
  const entryUrl = params.page ? `/${params.page}` : "/";
  const history = useNavigate();
  const [getEntries, setEntries] = useState({} as Page);
  const [error, setError] = useState(false);

  async function fetchData() {
    try {
      const result = await getPageRes(entryUrl);
      !result && setError(true);
      setEntries({ ...result });
      entry({ page: [result] });
    } catch (error) {
      setError(true);
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();
    console.log(error)
    // error && history("/404");
  }, [entryUrl, lpTs, error]);

  if (!getEntries) {
    return <div>Loading</div>
  }

  return Object.keys(getEntries).length ? (
    <RenderComponents
      pageComponents={getEntries?.page_components}
      contentTypeUid='page'
      entryUid={getEntries?.uid}
      locale={getEntries?.locale}
    />
  ) : (
    <Skeleton count={5} height={400} />
  );
}
