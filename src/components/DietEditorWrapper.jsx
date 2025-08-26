"use client";

import dynamic from "next/dynamic";

// dynamically import DietEditor on client only
const DietEditor = dynamic(() => import("./DietEditor"), { ssr: false });

export default function DietEditorWrapper(props) {
  return <DietEditor {...props} />;
}
