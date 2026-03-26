import { presetForms } from "@julr/unocss-preset-forms";
import {
	defineConfig,
	presetIcons,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	content: {
		filesystem: ["app/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
	},
	presets: [presetWind3({ dark: "class" }), presetIcons(), presetForms()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	safelist: ["text-xs", "text-gray-500"],
});
