import { z } from 'zod';

const IpAddressToolArgs = z.object({
	ipAddress: z.string().optional(),
});

type IpAddressToolArgsType = z.infer<typeof IpAddressToolArgs>;

export { IpAddressToolArgs, type IpAddressToolArgsType };
