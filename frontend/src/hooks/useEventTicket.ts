"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '../contracts/contracts';
import { parseEther } from 'viem';

/**
 * Hook to get event details from EventTicket contract
 */
export function useEventDetails(eventAddress?: string) {
    const { data: eventName } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'eventName',
    });

    const { data: eventDate } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'eventDate',
    });

    const { data: eventLocation } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'eventLocation',
    });

    const { data: ticketPrice } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'ticketPrice',
    });

    const { data: maxResalePrice } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'maxResalePrice',
    });

    const { data: totalTickets } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'totalTickets',
    });

    const { data: totalMinted } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'totalMinted',
    });

    return {
        eventName: eventName as string | undefined,
        eventDate: eventDate ? Number(eventDate) : undefined,
        eventLocation: eventLocation as string | undefined,
        ticketPrice: ticketPrice as bigint | undefined,
        maxResalePrice: maxResalePrice as bigint | undefined,
        totalTickets: totalTickets ? Number(totalTickets) : undefined,
        totalMinted: totalMinted ? Number(totalMinted) : undefined,
    };
}

/**
 * Hook to mint (purchase) a ticket
 */
export function useMintTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const mintTicket = (params: {
        to: string;
        tokenURI: string;
        price: bigint; // In wei
    }) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'mintTicket',
            args: [params.to, params.tokenURI],
            value: params.price,
        });
    };

    return {
        mintTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to get ticket price (if listed)
 */
export function useTicketPrice(eventAddress?: string, tokenId?: number) {
    const { data: price, refetch } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'ticketPrices',
        args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    });

    return {
        price: price as bigint | undefined,
        refetch,
    };
}

/**
 * Hook to list a ticket for sale
 */
export function useListTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const listTicket = (params: {
        tokenId: number;
        price: bigint; // In wei
    }) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'listTicket',
            args: [BigInt(params.tokenId), params.price],
        });
    };

    return {
        listTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to unlist a ticket
 */
export function useUnlistTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const unlistTicket = (tokenId: number) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'unlistTicket',
            args: [BigInt(tokenId)],
        });
    };

    return {
        unlistTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to buy a listed ticket
 */
export function useBuyListedTicket(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const buyListedTicket = (params: {
        tokenId: number;
        price: bigint; // In wei
    }) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'buyListedTicket',
            args: [BigInt(params.tokenId)],
            value: params.price,
        });
    };

    return {
        buyListedTicket,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to check if ticket is valid
 */
export function useIsTicketValid(eventAddress?: string, tokenId?: number, userAddress?: string) {
    const { data: isValid, isLoading, error, refetch } = useReadContract({
        address: eventAddress as `0x${string}`,
        abi: CONTRACTS.EventTicket.abi,
        functionName: 'isTicketValid',
        args: tokenId !== undefined && userAddress ? [BigInt(tokenId), userAddress] : undefined,
    });

    return {
        isValid: isValid as boolean | undefined,
        isLoading,
        error,
        refetch,
    };
}

/**
 * Hook to mark ticket as used (organizer only)
 */
export function useMarkTicketUsed(eventAddress?: string) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const markTicketUsed = (tokenId: number) => {
        if (!eventAddress) return;

        writeContract({
            address: eventAddress as `0x${string}`,
            abi: CONTRACTS.EventTicket.abi,
            functionName: 'markTicketUsed',
            args: [BigInt(tokenId)],
        });
    };

    return {
        markTicketUsed,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}
