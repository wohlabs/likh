export type ServiceResult<T = unknown> = {
	success: true;
	data: T;
}| {
	success: false;
	error: string;
};
