import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Variety } from './types';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { PublicKeyApi, SigningClient } from '@gala-chain/connect';
import { GalaChainResponse } from '@gala-chain/api';
import { TokenService } from './token/token.service';
import { TokenDataDto } from './dto/token.dto';
import { PublicKeyService } from './publickey/public-key.service';
import { CredentialsService } from './credentials/credentials.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(TokenService) private tokenService: TokenService,
    @Inject(PublicKeyService) private publicKeyService: PublicKeyService,
    @Inject(CredentialsService) private credentialsService: CredentialsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('v1/tokencreationjobs')
  getTokenCreationJobs(): string {
    return JSON.stringify([]);
  }

  @Post('server-side/test')
  async serverSignTest(): Promise<GalaChainResponse<unknown>> {
    const randomWallet = ethers.Wallet.createRandom();
    const registration = await this.appService.registerUser(
      this.credentialsService.getAdminUser(),
      randomWallet.publicKey,
    );
    const serverSigningClient = new SigningClient(randomWallet.privateKey);

    const dto = await serverSigningClient.sign('PublicKeyContract', {}); //Empty because we just need the signature
    return this.appService.postArbitrary(
      'PublicKeyContract',
      'GetMyProfile',
      dto,
    );
  }

  @Post('registerself/')
  async register(@Body('publicKey') publicKey: string) {
    const registration = await this.appService.registerUser(
      this.credentialsService.getAdminUser(),
      publicKey,
    );
    if (registration.Status === 1) {
      return registration;
    } else throw registration;
  }

  @Post('createToken')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createToken(@Body() tokenData: TokenDataDto) {
    return this.tokenService.createToken(tokenData, tokenData.authority);
  }

  @Post('galachain/api/asset/public-key-contract/GetPublicKey')
  getPublicKey(@Body('user') userAlias: string) {
    return this.publicKeyService.getPublicKey(userAlias);
  }

  @Post('v1/CreateHeadlessWallet')
  createHeadlessWallet(@Body('publicKey') publicKey: string) {
    return this.appService.registerUser(
      this.credentialsService.getAdminUser(),
      publicKey,
    );
  }

  @Post('asset/:contract/:method')
  async testMethod(
    @Param('contract') contract: string,
    @Param('method') method: string,
    @Body() body: any,
  ): Promise<GalaChainResponse<unknown>> {
    console.log(`Method: ${method}`);
    console.log(`Body: ${JSON.stringify(body)}`);
    return await this.appService.postArbitrary(contract, method, body);
  }

  @Post('create-eth')
  async createUser() {
    return this.appService.generateEthereumWallet();
  }

  @Post('register/new-random')
  async registerNewRandom(): Promise<{
    registration: GalaChainResponse<unknown>;
    publicKey: string;
    privateKey: string;
  }> {
    const randomWallet = ethers.Wallet.createRandom();
    const registration = await this.appService.registerUser(
      this.credentialsService.getAdminUser(),
      randomWallet.publicKey,
    );

    return {
      registration,
      publicKey: randomWallet.publicKey,
      privateKey: randomWallet.privateKey,
    };
  }

  @Post('register-eth/:public')
  async registerUser(
    @Param('public') publicKey: string,
  ): Promise<GalaChainResponse<unknown>> {
    return this.appService.registerUser(
      this.credentialsService.getAdminUser(),
      publicKey,
    );
  }
}
