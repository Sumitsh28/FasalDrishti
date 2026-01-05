import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";
import { useEffect } from "react";
import type { ControlPosition } from "react-map-gl";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  onCreate?: (evt: { features: object[] }) => void;
  onUpdate?: (evt: { features: object[]; action: string }) => void;
  onDelete?: (evt: { features: object[] }) => void;
};

export default function DrawControl(props: DrawControlProps) {
  useControl(
    () => new MapboxDraw(props) as any,
    ({ map }) => {
      map.on("draw.create", props.onCreate as any);
      map.on("draw.update", props.onUpdate as any);
      map.on("draw.delete", props.onDelete as any);
    },
    ({ map }) => {
      map.off("draw.create", props.onCreate as any);
      map.off("draw.update", props.onUpdate as any);
      map.off("draw.delete", props.onDelete as any);
    },
    {
      position: props.position,
    }
  );

  // NEW: Add tooltips to the generated DOM buttons
  useEffect(() => {
    // Small timeout to ensure Mapbox has rendered the controls
    const timer = setTimeout(() => {
      // 1. Select the buttons using their specific Mapbox GL Draw classes
      const polygonBtn = document.querySelector(".mapbox-gl-draw_polygon");
      const trashBtn = document.querySelector(".mapbox-gl-draw_trash");

      // 2. Add native title attributes (browser tooltip)
      if (polygonBtn) {
        polygonBtn.setAttribute("title", "Draw a selection area");
        // Optional: Add aria-label for accessibility
        polygonBtn.setAttribute("aria-label", "Draw a selection area");
      }

      if (trashBtn) {
        trashBtn.setAttribute("title", "Delete selected area");
        trashBtn.setAttribute("aria-label", "Delete selected area");
      }
    }, 500); // 500ms delay is usually enough for the map to init

    return () => clearTimeout(timer);
  }, []);

  return null;
}
