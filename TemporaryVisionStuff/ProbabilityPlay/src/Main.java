import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.MathContext;

public class Main {

    public static final MathContext mc = new MathContext(100);

    // Parameters that can be tuned
    public static final int numCarsTotal = 60000;
    public static final long possiblePlateTags = 35468115968L;
    public static final double ratioOfOutOfStateCars = 0.069; //6.9%

    public static final int numOutOfStateCars = (int)(numCarsTotal*ratioOfOutOfStateCars);
    public static final int numFloridaCars = numCarsTotal-numOutOfStateCars;
    public static final long totalPairs = binomial(numCarsTotal, 2).longValueExact();
    public static final int floridaFloridaPairs = binomial(numFloridaCars, 2).intValueExact();
    public static final int outOfStateOutOfStatePairs = binomial(numOutOfStateCars, 2).intValueExact();
    public static final long floridaOutOfStatePairs = totalPairs-floridaFloridaPairs-outOfStateOutOfStatePairs;

    public static final BigDecimal probabilityAPairOverlaps = new BigDecimal(((outOfStateOutOfStatePairs/(double)totalPairs)*(48.0/49.0)*(1/(double)possiblePlateTags))+((floridaOutOfStatePairs/(double)totalPairs)*(1/(double)possiblePlateTags)), mc);
    public static final BigDecimal probabilityAPairDoesNotOverlap = BigDecimal.ONE.subtract(probabilityAPairOverlaps, mc);

    public static void main(String[] args) {
//        System.out.println(probabilityExactlyNPairsOverlap(1));
//        System.out.println(probabilityExactlyNPairsOverlap(2));
//        System.out.println(probabilityExactlyNPairsOverlap(4));
//        System.out.println(probabilityExactlyNPairsOverlap(8));
//        System.out.println(probabilityExactlyNPairsOverlap(16));

        probabilityMoreThanNOverlap(0);
        probabilityMoreThanNOverlap(1);
        probabilityMoreThanNOverlap(3);
        probabilityMoreThanNOverlap(5);
        probabilityMoreThanNOverlap(8);
        probabilityMoreThanNOverlap(10);
    }

    private static void probabilityMoreThanNOverlap(int limit) {
        System.out.println("The probability that more than " + limit + " pair(s) overlap is:");

        BigDecimal totalProb = new BigDecimal(0, mc);
        for (int i = 0; i <= limit; i++) {
            totalProb = totalProb.add(probabilityExactlyNPairsOverlap(i), mc);
        }
        System.out.println(BigDecimal.ONE.subtract(totalProb, mc));
    }

    private static BigDecimal probabilityExactlyNPairsOverlap(int n) {
        // First pick which n overlap
        BigDecimal pickWays = new BigDecimal(binomial(totalPairs, n), mc);

        // Now give me that many overlaps...
        BigDecimal overlaps = probabilityAPairOverlaps.pow(n, mc);

        // And non-overlaps... circumvent the stupid limit of 999999999 exponent in pow...
        BigDecimal nonOverlaps = BigDecimal.ONE;
        long remaining = totalPairs-n;
        while (remaining > 0) {
            long amount = Math.min(999999999, remaining);
            nonOverlaps = nonOverlaps.multiply(probabilityAPairDoesNotOverlap.pow((int)amount, mc), mc);
            remaining -= amount;
        }

        // Multiply it together
        return pickWays.multiply(overlaps.multiply(nonOverlaps, mc), mc);
    }

    private static BigInteger binomial(final long N, final int K) {
        BigInteger ret = BigInteger.ONE;
        for (int k = 0; k < K; k++) {
            ret = ret.multiply(BigInteger.valueOf(N-k))
                    .divide(BigInteger.valueOf(k+1));
        }
        return ret;
    }
}
