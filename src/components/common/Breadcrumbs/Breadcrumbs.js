import { Breadcrumb } from 'antd';
import { useMatches } from 'react-router-dom';

export function Breadcrumbs() {
    const matches = useMatches();
    const breadcrumbs = matches
    .filter((match) => match.handle?.breadcrumb)
    .map((match, index) => {
      const breadcrumb = match.handle.breadcrumb;
      
      const isLast = index === matches.length - 1;

      const breadcrumbText =
        typeof breadcrumb === "function"
          ? breadcrumb(match.params || match.params[0])
          : breadcrumb;

      return isLast ? {
        title : breadcrumbText
      } :{
        title: breadcrumbText,
        href: match.pathname,
      };
    });
  return <Breadcrumb items={breadcrumbs} />
}

