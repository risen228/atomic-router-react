import React, { AnchorHTMLAttributes } from "react";
import clsx from "clsx";
import { useUnit } from "effector-react";
import { buildPath, RouteInstance, RouteParams, RouteQuery } from "atomic-router";

import { useRouter } from "./router-provider";

type Props<Params extends RouteParams> = {
  to: RouteInstance<Params> | string;
  params?: Params;
  query?: RouteQuery;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
} & Exclude<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Link<Params extends RouteParams>({
  to,
  params,
  query,
  className,
  activeClassName = "active",
  inactiveClassName,
  ...props
}: Props<Params>) {
  if (typeof to === "string") {
    return <NormalLink href={to} className={className} {...props} />;
  }
  return (
    <RouteLink
      {...{
        to,
        params,
        query,
        className,
        activeClassName,
        inactiveClassName,
      }}
      {...props}
    />
  );
}

function NormalLink({
  className,
  ...props
}: { className?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={clsx(className)} {...props} />;
}

function RouteLink<Params extends RouteParams>({
  to,
  params,
  query,
  className,
  activeClassName = "active",
  inactiveClassName,
  onClick,
  ...props
}: {
  to: RouteInstance<Params>;
  params?: Params;
  query?: RouteQuery;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const router = useRouter();
  const routeObj = router.routes.find((routeObj) => routeObj.route === to);

  if (!routeObj) {
    throw new Error("[RouteLink] Route not found");
  }

  const [isOpened, navigate] = useUnit([routeObj.route.$isOpened, to.navigate]);

  const href = buildPath({
    pathCreator: routeObj.path,
    params: params || {},
    query: query || {},
  });

  return (
    <a
      href={href}
      className={clsx(className, isOpened ? activeClassName : inactiveClassName)}
      onClick={(evt) => {
        evt.preventDefault();
        navigate({
          params: params || ({} as Params),
          query: query || {},
        });
        if (onClick) {
          onClick(evt);
        }
      }}
      {...props}
    >
      {props.children}
    </a>
  );
}
