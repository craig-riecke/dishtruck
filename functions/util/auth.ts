import * as jwt from 'jsonwebtoken';

export class Auth {
  private static signingKey: any = {};

  public static async jwtPrincipal(authHeader: string): Promise<any> {
    const jwksClient = require('jwks-rsa');
    const jwToken = authHeader.split(/ /)[1];
    // We only decode to get the kid in the header.
    const decodedToken: jwt.Jwt | null = jwt.decode(jwToken, {
      complete: true,
    });
    if (!decodedToken) {
      throw new Error('Could not decode JWT');
    }
    var client = jwksClient({
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    });

    const kid = decodedToken.header.kid || 'N/A';
    console.log(`Using kid ${kid}`);
    if (!this.signingKey[kid]) {
      const key = await client.getSigningKey(kid);
      this.signingKey[kid] = key.getPublicKey();
    }

    try {
      return jwt.verify(jwToken, this.signingKey[kid]);
    } catch (err) {
      console.error(
        'Something bad happened when trying to verify token: ' + err
      );
      throw err;
    }
  }
}
