"use client";
import { useEffect, useState } from "react";

export default function LottiePlayer({ animationData = null, src = "", style = {} }) {
  const [data, setData] = useState(animationData);
  const [LottieComponent, setLottieComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;

    import("lottie-react")
      .then((mod) => {
        if (isMounted) {
          setLottieComponent(() => mod.default || mod);
        }
      })
      .catch((err) => {
        console.warn("[LottiePlayer] lottie-react load skipped:", err);
      });

    if (src && !animationData) {
      fetch(src)
        .then((res) => res.json())
        .then((json) => {
          if (isMounted) setData(json);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [src, animationData]);

  if (!LottieComponent || !data) {
    return <div style={{ height: 380, ...style }} />;
  }

  const Comp = LottieComponent;
  return <Comp animationData={data} style={style} />;
}
