import { useMatches } from 'react-router-dom';

export function useBreadcrumbs() {
    const matches = useMatches();
    const breadcrumbs = matches
    .filter((match: any) => match.handle?.breadcrumb)
    .map((match: any, index) => {
      const breadcrumb = match.handle.breadcrumb;
      const isLast = index === matches.length - 1;

      const breadcrumbText =
        typeof breadcrumb === "function"
          ? breadcrumb(match.params)
          : breadcrumb;

      return isLast ? {
        title : breadcrumbText
      } :{
        title: breadcrumbText,
        href: match.pathname,
      };
    });
  return {breadcrumbs}
}

