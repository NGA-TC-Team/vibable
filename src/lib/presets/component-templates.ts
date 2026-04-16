import type { ComponentCategory, ComponentStyle } from "@/types/phases";

export const COMPONENT_TEMPLATES: Record<ComponentCategory, {
  label: string;
  defaultComponent: Partial<ComponentStyle>;
}> = {
  button: {
    label: "버튼",
    defaultComponent: {
      component: "Button",
      category: "button",
      variants: "primary, secondary, ghost, outlined",
      borderRadius: "4px",
      defaultStyle: {
        background: "#533afd",
        textColor: "#ffffff",
        padding: "8px 16px",
        fontSize: "16px",
        fontWeight: "400",
      },
      hoverStyle: {
        background: "#4434d4",
      },
    },
  },
  card: {
    label: "카드",
    defaultComponent: {
      component: "Card",
      category: "card",
      variants: "default, featured, compact",
      borderRadius: "6px",
      defaultStyle: {
        background: "#ffffff",
        borderColor: "#e5edf5",
        shadow: "rgba(50,50,93,0.25) 0px 30px 45px -30px",
        padding: "16px",
      },
    },
  },
  input: {
    label: "입력 필드",
    defaultComponent: {
      component: "Input",
      category: "input",
      variants: "default, focus, error, disabled",
      borderRadius: "4px",
      defaultStyle: {
        background: "#ffffff",
        textColor: "#061b31",
        borderColor: "#e5edf5",
        padding: "8px 12px",
        fontSize: "14px",
      },
    },
  },
  badge: {
    label: "뱃지/태그",
    defaultComponent: {
      component: "Badge",
      category: "badge",
      variants: "default, success, warning, error",
      borderRadius: "4px",
      defaultStyle: {
        background: "#f6f9fc",
        textColor: "#000000",
        padding: "1px 6px",
        fontSize: "11px",
      },
    },
  },
  navigation: {
    label: "내비게이션",
    defaultComponent: {
      component: "Navigation",
      category: "navigation",
      variants: "horizontal, mobile hamburger",
      borderRadius: "6px",
      defaultStyle: {
        background: "#ffffff",
        textColor: "#061b31",
        fontSize: "14px",
        fontWeight: "400",
      },
    },
  },
  modal: {
    label: "모달/다이얼로그",
    defaultComponent: {
      component: "Modal",
      category: "modal",
      variants: "default, fullscreen, sheet",
      borderRadius: "8px",
      defaultStyle: {
        background: "#ffffff",
        shadow: "rgba(3,3,39,0.25) 0px 14px 21px -14px",
        padding: "24px",
      },
    },
  },
  table: {
    label: "테이블",
    defaultComponent: {
      component: "Table",
      category: "table",
      variants: "default, compact, striped",
      borderRadius: "4px",
      defaultStyle: {
        background: "#ffffff",
        borderColor: "#e5edf5",
      },
    },
  },
  custom: {
    label: "커스텀",
    defaultComponent: {
      component: "",
      category: "custom",
      variants: "",
      borderRadius: "",
    },
  },
};
