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
    console.debug("user: ", user);

    if (!user) throw new UnprocessableEntityError("Invalid user email or password");

    const isValidPassword = await this.validatePassword(data.password, user.hashedPassword);
    console.debug("isValid: ", isValidPassword);

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
    console.debug("tokenExpireDate: ", tokenExpireDate);

    const newToken = this.accessTokenRepository.create({
      token,
      user,
      expiresAt: fromUnixTime(tokenExpireDate),
    });

    return this.accessTokenRepository.save(newToken);
  }

  private getJwtTokenExpireDate(token: string): number {
    console.debug("token: ", token);
    const { exp } = decode(token) as { [exp: string]: number };
    return exp;
  }

  private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async validateJwt(jwt: string): Promise<boolean> {
    const accessToken = await this.getAccessToken(jwt);
    return accessToken && new Date(accessToken.expiresAt).getTime() > Date.now() ? true : false;
  }

  public async validateAuthHeader(authHeader: string | undefined): Promise<boolean> {
    let isValidAuth = false;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      console.debug("VALID Bearer")
      isValidAuth = await this.validateJwt(authHeader.substring(7, authHeader.length));
    }

    if (!isValidAuth) throw new UnauthorizedError("Unauthorized user.");

    return isValidAuth;
  }

  private async getAccessToken(jwt: string): Promise<AccessToken | null> {
    return this.accessTokenRepository.findOneBy({ token: jwt });
  }
}
