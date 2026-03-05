export type SessionCategoryId = "all" | "quick" | "focus" | "advanced";

export type SessionTypeId = "daily" | "topic";

export type SessionActionId = "daily" | "topic";

export type NumberFieldSchema = {
  id: string;
  type: "number";
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

export type TopicMultiSelectFieldSchema = {
  id: string;
  type: "topic-multi-select";
  label: string;
  description?: string;
  required?: boolean;
  minSelection?: number;
};

export type SessionParamSchema = NumberFieldSchema | TopicMultiSelectFieldSchema;

export type SessionTypeDefinition = {
  id: SessionTypeId;
  actionId: SessionActionId;
  name: string;
  subtitle: string;
  description: string;
  badgeLabel: string;
  category: Exclude<SessionCategoryId, "all">;
  estimatedDurationLabel: string;
  difficultyLabel: string;
  featureBullets: string[];
  launcherTitle: string;
  launcherDescription: string;
  submitLabel: string;
  paramsSchema: SessionParamSchema[];
};

export const SESSION_CATEGORIES: Array<{
  id: SessionCategoryId;
  label: string;
}> = [
  { id: "all", label: "Tất cả" },
  { id: "quick", label: "Nhanh" },
  { id: "focus", label: "Theo mục tiêu" },
  { id: "advanced", label: "Nâng cao" },
];

export const SESSION_TYPE_REGISTRY: SessionTypeDefinition[] = [
  {
    id: "daily",
    actionId: "daily",
    name: "Phiên Daily",
    subtitle: "Ôn tập hằng ngày",
    description:
      "Hệ thống tự chọn bộ câu hỏi theo tiến độ và lịch sử gần nhất của bạn.",
    badgeLabel: "Daily",
    category: "quick",
    estimatedDurationLabel: "10-15 phút",
    difficultyLabel: "Cơ bản",
    featureBullets: [
      "Khởi chạy nhanh, không cần cấu hình nhiều.",
      "Ưu tiên từ đang học và từ dễ quên.",
    ],
    launcherTitle: "Khởi tạo phiên Daily",
    launcherDescription:
      "Phù hợp cho thói quen học mỗi ngày với cấu hình mặc định của hệ thống.",
    submitLabel: "Bắt đầu phiên Daily",
    paramsSchema: [],
  },
  {
    id: "topic",
    actionId: "topic",
    name: "Phiên theo chủ đề",
    subtitle: "Tập trung theo mục tiêu",
    description:
      "Chọn nhiều chủ đề và số câu để cá nhân hóa phiên luyện tập theo nhu cầu.",
    badgeLabel: "Topic",
    category: "focus",
    estimatedDurationLabel: "10-30 phút",
    difficultyLabel: "Linh hoạt",
    featureBullets: [
      "Phù hợp khi cần học sâu một nhóm từ cụ thể.",
      "Điều chỉnh số câu theo quỹ thời gian của bạn.",
    ],
    launcherTitle: "Khởi tạo phiên theo chủ đề",
    launcherDescription:
      "Chọn ít nhất một chủ đề. Bạn có thể thay đổi số câu trước khi bắt đầu.",
    submitLabel: "Bắt đầu theo chủ đề",
    paramsSchema: [
      {
        id: "topicIds",
        type: "topic-multi-select",
        label: "Danh sách chủ đề",
        description: "Chọn một hoặc nhiều chủ đề.",
        required: true,
        minSelection: 1,
      },
      {
        id: "totalItems",
        type: "number",
        label: "Số câu",
        description: "Số nguyên dương. Mặc định 20 câu.",
        required: false,
        defaultValue: 20,
        min: 1,
        step: 1,
        placeholder: "20",
      },
    ],
  },
];
