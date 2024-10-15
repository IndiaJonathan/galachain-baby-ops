import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class TokenDataDto {
  @IsNumber()
  decimals: number;

  @IsString()
  collection: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  name: string;

  @IsBoolean()
  isNonFungible: boolean;

  @IsString()
  image: string;

  @IsString()
  rarity: string;

  @IsString()
  authority: string;

  @IsOptional()
  @IsNumber()
  maxSupply?: number;
}
