import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class EthAddressDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}
