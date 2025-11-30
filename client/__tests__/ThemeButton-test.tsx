import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import ThemeButton from "@/components/ThemeButton";

describe("<ThemeButton />", () => {
	test("Text renders as lowercase", () => {
		const { getByText } = render(
			<ThemeButton labelStyle={[{ alignContent: "center" }]}>
				V3ry FunNY miXeD-case LETTERS !@#$%^&*
			</ThemeButton>
		);

		const buttonText = getByText("V3ry FunNY miXeD-case LETTERS !@#$%^&*");

		const style = StyleSheet.flatten(buttonText.props.style);
		const hasLowercase = Array.isArray(style)
			? style.some((s) => s?.textTransform === "lowercase")
			: style?.textTransform === "lowercase";

		expect(hasLowercase).toBe(true);
	});

	test("Text lowercase transform gets overwritten successfully", () => {
		const { getByText } = render(
			<ThemeButton labelStyle={{textTransform: 'capitalize'}}> V3ry FunNY miXeD-case LETTERS !@#$%^&* </ThemeButton>
		);

		const buttonText = getByText("V3ry FunNY miXeD-case LETTERS !@#$%^&*");

		const style = StyleSheet.flatten(buttonText.props.style);
		const hasCap = Array.isArray(style)
			? style.some((s) => s?.textTransform === "capitalize")
			: style?.textTransform === "capitalize";

		expect(hasCap).toBe(true);
	});
});
