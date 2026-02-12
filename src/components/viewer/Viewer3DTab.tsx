import { useEffect } from "react";
import { useViewerStore, useNodeStore } from "@/stores";
import { PointCloudViewer } from "./PointCloudViewer";
import { ViewerControls } from "./ViewerControls";
import { NodeCreateDialog } from "@/components/node/NodeCreateDialog";
import { NodeDetailSheet } from "@/components/node/NodeDetailSheet";
import type { FloorResponse } from "@/types";

interface Viewer3DTabProps {
  floors: FloorResponse[];
}

export function Viewer3DTab({ floors }: Viewer3DTabProps) {
  const setFloors = useViewerStore((s) => s.setFloors);
  const viewerReset = useViewerStore((s) => s.reset);
  const selectedFloorId = useViewerStore((s) => s.selectedFloorId);
  const showPOI = useViewerStore((s) => s.showPOI);
  const fetchNodes = useNodeStore((s) => s.fetchNodes);
  const nodeReset = useNodeStore((s) => s.reset);
  const selectedNodeId = useNodeStore((s) => s.selectedNodeId);
  const selectNode = useNodeStore((s) => s.selectNode);

  useEffect(() => {
    setFloors(floors);
    return () => {
      viewerReset();
      nodeReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors]);

  useEffect(() => {
    if (selectedFloorId && showPOI) {
      fetchNodes(selectedFloorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFloorId, showPOI]);

  return (
    <div className="flex gap-4 h-[600px]">
      <PointCloudViewer />
      <ViewerControls />
      <NodeCreateDialog />
      <NodeDetailSheet
        nodeId={selectedNodeId}
        open={selectedNodeId !== null}
        onOpenChange={(open) => {
          if (!open) selectNode(null);
        }}
      />
    </div>
  );
}
