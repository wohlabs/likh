import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type ReadMoreProps = {
	numberOfLines?: number;
	textStyle?: TextStyle;
	children?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	onReady?: () => void;
	renderTruncatedFooter?: (handlePress: () => void) => React.ReactNode;
	renderRevealedFooter?: (handlePress: () => void) => React.ReactNode;
};

type ReadMoreState = {
	measured: boolean;
	shouldShowReadMore: boolean;
	showAllText: boolean;
};

export default class ReadMore extends React.Component<ReadMoreProps, ReadMoreState> {
	private _isMounted = false;
	// using `any` because the RN Text ref has measure but TypeScript defs vary by RN version
	private _text: any = null;

	state: ReadMoreState = {
		measured: false,
		shouldShowReadMore: false,
		showAllText: false,
	};

	async componentDidMount(): Promise<void> {
		this._isMounted = true;
		await nextFrameAsync();

		if (!this._isMounted) {
			return;
		}

		const fullHeight = await measureHeightAsync(this._text);
		this.setState({ measured: true });
		await nextFrameAsync();

		if (!this._isMounted) {
			return;
		}

		const limitedHeight = await measureHeightAsync(this._text);

		if (fullHeight > limitedHeight) {
			this.setState({ shouldShowReadMore: true }, () => {
				this.props.onReady && this.props.onReady();
			});
		} else {
			this.props.onReady && this.props.onReady();
		}
	}

	componentWillUnmount(): void {
		this._isMounted = false;
	}

	render(): React.ReactNode {
		const { measured, showAllText } = this.state;
		const { numberOfLines } = this.props;

		return (
			<View style={this.props.style}>
				<Text
					// when not measured or showing all, set to 0 to show unlimited lines (keeps original behavior)
					numberOfLines={measured && !showAllText ? numberOfLines : 0}
					style={this.props.textStyle}
					ref={(text) => {
						this._text = text;
					}}
				>
					{this.props.children}
				</Text>

				{this._maybeRenderReadMore()}
			</View>
		);
	}

	_handlePressReadMore = () => {
		this.setState({ showAllText: true });
	};

	_handlePressReadLess = () => {
		this.setState({ showAllText: false });
	};

	_maybeRenderReadMore(): React.ReactNode {
		const { shouldShowReadMore, showAllText } = this.state;

		if (shouldShowReadMore && !showAllText) {
			if (this.props.renderTruncatedFooter) {
				return this.props.renderTruncatedFooter(this._handlePressReadMore);
			}

			return (
				<Text style={styles.button} onPress={this._handlePressReadMore}>
					Read more
				</Text>
			);
		} else if (shouldShowReadMore && showAllText) {
			if (this.props.renderRevealedFooter) {
				return this.props.renderRevealedFooter(this._handlePressReadLess);
			}

			return (
				<Text style={styles.button} onPress={this._handlePressReadLess}>
					Hide
				</Text>
			);
		}

		return null;
	}
}

function measureHeightAsync(component: any): Promise<number> {
	return new Promise((resolve) => {
		if (!component || typeof component.measure !== "function") {
			resolve(0);
			return;
		}

		component.measure((x: number, y: number, w: number, h: number) => {
			resolve(h);
		});
	});
}

function nextFrameAsync(): Promise<void> {
	return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

const styles = StyleSheet.create({
	button: {
		color: "#888",
		marginTop: 5,
	},
});
