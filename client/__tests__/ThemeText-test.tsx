import ThemeText from "@/components/ThemeText";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

describe("<ThemeText />", () => {
	test("Text renders as lowercase", () => {
		const { getByText } = render(
			<ThemeText> V3ry FunNY miXeD-case LETTERS !@#$%^&* </ThemeText>
		);

		const text = getByText("V3ry FunNY miXeD-case LETTERS !@#$%^&*");

		const style = StyleSheet.flatten(text.props.style);
		const hasLowercase = Array.isArray(style)
			? style.some((s) => s?.textTransform === "lowercase")
			: style?.textTransform === "lowercase";

		expect(hasLowercase).toBe(true);
	});

	test("Text lowercase transform gets overwritten successfully", () => {
		const { getByText } = render(
			<ThemeText style={{textTransform: 'capitalize'}}> V3ry FunNY miXeD-case LETTERS !@#$%^&* </ThemeText>
		);

		const text = getByText("V3ry FunNY miXeD-case LETTERS !@#$%^&*");

		const style = StyleSheet.flatten(text.props.style);
		const hasCap = Array.isArray(style)
			? style.some((s) => s?.textTransform === "capitalize")
			: style?.textTransform === "capitalize";

		expect(hasCap).toBe(true);
	});
});
