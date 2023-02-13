import * as bcrypt from "bcrypt";
import config from "config/config";
import { fromUnixTime } from "date-fns";
import { UnauthorizedError, UnprocessableEntityError } from "errors/errors";
import { decode, sign } from "jsonwebtoken";
import { UsersService } from "modules/users/users.service";
import { Repository } from "typeorm";
import { LoginUserDto } from "./dto/login-user.dto";
import { AccessToken } from "./entities/access-token.entity";
import dataSource from "orm/orm.config";

export class AuthService {
  private readonly accessTokenRepository: Repository<AccessToken>;
  private readonly usersService: UsersService;

  constructor() {
    this.accessTokenRepository = dataSource.getRepository(AccessToken);
    this.usersService = new UsersService();
  }

  public async login(data: LoginUserDto): Promise<AccessToken> {
    const user = await this.usersService.findOneBy({ email: data.email });

    if (!user) throw new UnprocessableEntityError("Invalid user email or password");

    const isValidPassword = await this.validatePassword(data.password, user.hashedPassword);

    if (!isValidPassword) throw new UnprocessableEntityError("Invalid user email or password");

    const token = sign(
      {
        id: user.id,
        email: user.email,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_AT },
    );
    const tokenExpireDate = this.getJwtTokenExpireDate(token);

    const newToken = this.accessTokenRepository.create({
      token,
      user,
      expiresAt: fromUnixTime(tokenExpireDate),
    });

    return this.accessTokenRepository.save(newToken);
  }

  private getJwtTokenExpireDate(token: string): number {
    const { exp } = decode(token) as { [exp: string]: number };
    return exp;
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private validateAccessToken(accessToken: AccessToken | null): boolean {
    return accessToken && new Date(accessToken.expiresAt).getTime() > Date.now() ? true : false;
  }

  public async validateAuthHeader(authHeader: string | undefined): Promise<AccessToken> {
    let isValidAuth = false;
    let validAccessToken = {} as AccessToken;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const accessToken = await this.getAccessToken(authHeader.substring(7, authHeader.length));
      if (accessToken) {
        validAccessToken = accessToken;
        isValidAuth = this.validateAccessToken(accessToken);
      }
    }

    if (!isValidAuth) throw new UnauthorizedError("Unauthorized user.");

    return validAccessToken;
  }

  private async getAccessToken(jwt: string): Promise<AccessToken | null> {
    return this.accessTokenRepository
      .createQueryBuilder("access_token")
      .where({ token: jwt })
      .leftJoinAndSelect("access_token.user", "user")
      .getOne();
  }
}
