import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import parse from "html-react-parser";

import ArchiveRelative from "../components/archive-relative";
import RenderComponents from "../components/render-components";
import { getPageRes, getBlogPostRes } from "../helper";
import Skeleton from "react-loading-skeleton";
import { useLivePreviewCtx } from "../context/live-preview-context-provider";
import { BlogPostRes, Page } from "../typescript/pages";
import { EntryProps } from "../typescript/components";

export default function BlogPost({entry}:{entry:({page, blogPost}:EntryProps)=> void}) {
  const lpTs = useLivePreviewCtx();
  const { blogId } = useParams();
  const history = useNavigate();
  const [getEntry, setEntry] = useState({
    banner: {} as Page,
    post: {} as BlogPostRes,
  });
  const [error, setError] = useState(false);

  async function fetchData() {
    try {
      const entryUrl = blogId ? `/blog/${blogId}` : "/";
      const banner = await getPageRes("/blog");
      const post = await getBlogPostRes(entryUrl);
      (!banner || !post) && setError(true);
      setEntry({ banner, post });
      entry({ page: [banner], blogPost: [post] });
    } catch (error) {
      console.error(error);
      setError(true);
    }
  }

  useEffect(() => {
    fetchData();
    // error && history("/404");
  }, [blogId, lpTs, error]);

  const { post, banner } = getEntry;

  if (!post || !banner) {
    return <div>Loading</div>
  }
  
  return (
    <>
      {banner ? (
        <RenderComponents
          pageComponents={banner.page_components}
          blogsPage
          contentTypeUid='blog_post'
          entryUid={banner.uid}
          locale={banner.locale}
        />
      ) : (
        <Skeleton height={400} />
      )}

      <div className='blog-container'>
        <article className='blog-detail'>
          {post.title ? (
            <h2 {...(post.$?.title as {})}>{post.title}</h2>
          ) : (
            <h2>
              <Skeleton />
            </h2>
          )}
          {post.date ? (
            <p {...(post.$?.date as {})}>
              {moment(post.date).format("ddd, MMM D YYYY")},{" "}
              <strong {...(post.author[0].$?.title as {})}>
                {post.author[0].title}
              </strong>
            </p>
          ) : (
            <p>
              <Skeleton width={300} />
            </p>
          )}
          {post.body ? (
            <div {...(post.$?.body as {})}>{parse(post.body)}</div>
          ) : (
            <Skeleton height={800} width={600} />
          )}
        </article>
        <div className='blog-column-right'>
          <div className='related-post'>
            {Object.keys(banner).length && banner.page_components[2].widget ? (
              <h2 {...(banner?.page_components[2].widget.$?.title_h2 as {})}>
                {banner?.page_components[2].widget.title_h2}
              </h2>
            ) : (
              <h2>
                <Skeleton />
              </h2>
            )}
            {post.related_post ? (
              <ArchiveRelative
                {...post.$?.related_post}
                blogs={post.related_post}
              />
            ) : (
              <Skeleton width={300} height={500} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
