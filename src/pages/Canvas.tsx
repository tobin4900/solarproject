import { useParams, useSearchParams } from "react-router-dom";
import CanvasEditor from "@/components/canvas/CanvasEditor";
import { isValidSceneId } from "@/lib/scene-utils";
import { useEffect } from "react";

const Canvas = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isViewOnly = searchParams.get("viewOnly") === "true";

  useEffect(() => {
    if (!id || !isValidSceneId(id)) {
      window.location.href = "/";
      return;
    }
  }, [id]);

  if (!id || !isValidSceneId(id)) {
    return null;
  }

  return <CanvasEditor sceneId={id} isViewOnly={isViewOnly} />;
};

export default Canvas;